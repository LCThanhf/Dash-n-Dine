import { useState, useEffect } from "react";
import Card from "../UI/Card";
import classes from "./AvailableMeals.module.css";
import MealItem from "./MealItem/MealItem";
import MealTypeFilter from "./MealTypeFilter";

const AvailableMeals = () => {
  const [meals, setMeals] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [httpError, setHttpError] = useState();
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const typeQuery = selectedType !== 'ALL' ? `?type=${selectedType}` : '';
        const response = await fetch(`https://dnd-backend-sigma.vercel.app/api/food-items${typeQuery}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch meals: ${response.status} - ${errorText}`);
        }
  
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
  
        const loadedMeals = data.map(meal => ({
          id: meal.id,
          name: meal.name,
          price: parseFloat(meal.price),
          type: meal.type,
          image: meal.image
        }));
  
        setMeals(loadedMeals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching meals:', error);
        setLoading(false);
        setHttpError(error.message);
      }
    };
  
    setLoading(true);
    fetchMeals();
  }, [selectedType]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <section className={classes.mealsLoading}>Loading...</section>;
  }

  if (httpError) {
    return <section className={classes.mealsError}>{httpError}</section>;
  }

  const mealsList = filteredMeals.length > 0 ? (
    filteredMeals.map((meal) => (
      <MealItem
        key={meal.id}
        id={meal.id}
        name={meal.name}
        price={meal.price}
        image={meal.image}
      />
    ))
  ) : (
    <p className={classes.noItemsFound}>Sorry, some items are not available.</p>
  );

  return (
    <section className={classes.meals}>
      <MealTypeFilter selectedType={selectedType} onTypeChange={handleTypeChange} onSearch={handleSearch} />
      <Card>
        <ul>{mealsList}</ul>
      </Card>
    </section>
  );
};

export default AvailableMeals;