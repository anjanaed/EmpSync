import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class IngredientsService {
  constructor(private readonly databaseServices: DatabaseService) {}

  async create(createIngredientDto: Prisma.IngredientCreateInput | Prisma.IngredientCreateInput[]) {
    try {
      if (Array.isArray(createIngredientDto)) {
        return await this.databaseServices.ingredient.createMany({
          data: createIngredientDto.map(ingredient => ({
            ...ingredient,
            price_per_unit: parseFloat(ingredient.price_per_unit.toString()),
            quantity: parseInt(ingredient.quantity.toString())
          }))
        });
      }
      return await this.databaseServices.ingredient.create({ 
        data: {
          ...createIngredientDto,
          price_per_unit: parseFloat(createIngredientDto.price_per_unit.toString()),
          quantity: parseInt(createIngredientDto.quantity.toString())
        } 
      });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new HttpException(
          'Ingredient with this ID or Name already exists',
          HttpStatus.CONFLICT
        );
      }
      throw new HttpException(
        'Failed to create ingredient',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll() {
    const ingredients = await this.databaseServices.ingredient.findMany({});
    if (!ingredients || ingredients.length === 0) {
      throw new HttpException('No Ingredients', HttpStatus.NOT_FOUND);
    }
    return ingredients;
  }

  async findOne(id: string) {
    const ingredient = await this.databaseServices.ingredient.findUnique({
      where: { id }
    });
    if (!ingredient) {
      throw new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND);
    }
    return ingredient;
  }

  async update(id: string, updateIngredientDto: Prisma.IngredientUpdateInput) {
    const ingredient = await this.findOne(id);
    if (!ingredient) {
      throw new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND);
    }
    return this.databaseServices.ingredient.update({
      where: { id },
      data: updateIngredientDto,
    });
  }

  async remove(id: string) {
    const ingredient = await this.findOne(id);
    if (!ingredient) {
      throw new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND);
    }
    return this.databaseServices.ingredient.delete({
      where: { id },
    });
  }

  async findLowPriceIngredients() {
    console.log('Fetching low price ingredients...');

    // Fetch ingredients from database
    const ingredients = await this.databaseServices.ingredient.findMany({
        select: {
            id: true,
            name: true,
            price_per_unit: true,
            quantity: true,
        },
    });

    // Step 1: Sort ingredients by name first, then by price_per_unit in ascending order
    ingredients.sort((a, b) => {
      const nameComparison = a.name.localeCompare(b.name);
      return nameComparison !== 0 ? nameComparison : Number(a.price_per_unit) - Number(b.price_per_unit);
    });

    // Step 2: Group ingredients by name
    const groupedIngredients: Record<string, any[]> = {};
    for (const ingredient of ingredients) {
        if (!groupedIngredients[ingredient.name]) {
            groupedIngredients[ingredient.name] = [];
        }
        groupedIngredients[ingredient.name].push(ingredient);
    }

    // Step 3: Use Binary Search to find the lowest price variant in each group
    function binarySearchLowest(items: any[]): any {
        let left = 0;
        let right = items.length - 1;
        let lowest = items[0]; // Since array is sorted, first element is the lowest

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            if (items[mid].price_per_unit < lowest.price_per_unit) {
                lowest = items[mid];
            }
            right = mid - 1; // Keep searching in the left half for a lower price
        }

        return lowest;
    }

    // Step 4: Construct the final list with price comparisons
    const lowPriceIngredients = Object.entries(groupedIngredients).map(([name, items]) => {
        const lowest = binarySearchLowest(items);
        const highestPrice = items[items.length - 1].price_per_unit; // Since array is sorted, last element has the highest price

        return {
            ...lowest,
            priceComparison: {
                lowestPrice: lowest.price_per_unit,
                highestPrice: highestPrice,
                priceDifference: highestPrice - lowest.price_per_unit,
                totalVariants: items.length
            }
        };
    });

    return lowPriceIngredients;
  }

  async findHighPriceIngredients() {
    console.log('Fetching high price ingredients...');

    // Fetch ingredients from database
    const ingredients = await this.databaseServices.ingredient.findMany({
        select: {
            id: true,
            name: true,
            price_per_unit: true,
            quantity: true,
        },
    });

    // Step 1: Sort ingredients by name first, then by price_per_unit in descending order
    ingredients.sort((a, b) => a.name.localeCompare(b.name) || Number(b.price_per_unit) - Number(a.price_per_unit));

    // Step 2: Group ingredients by name
    const groupedIngredients: Record<string, any[]> = {};
    for (const ingredient of ingredients) {
        if (!groupedIngredients[ingredient.name]) {
            groupedIngredients[ingredient.name] = [];
        }
        groupedIngredients[ingredient.name].push(ingredient);
    }

    // Step 3: Use Binary Search to find the highest price variant in each group
    function binarySearchHighest(items: any[]): any {
        let left = 0;
        let right = items.length - 1;
        let highest = items[0]; // Since array is sorted, first element is the highest

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            if (items[mid].price_per_unit > highest.price_per_unit) {
                highest = items[mid];
            }
            left = mid + 1; // Keep searching in the right half for a higher price
        }

        return highest;
    }

    // Step 4: Construct the final list with price comparisons
    const highPriceIngredients = Object.entries(groupedIngredients).map(([name, items]) => {
        const highest = binarySearchHighest(items);
        const lowestPrice = items[items.length - 1].price_per_unit; // Since sorted, last element is the lowest

        return {
            ...highest,
            priceComparison: {
                lowestPrice: lowestPrice,
                highestPrice: highest.price_per_unit,
                priceDifference: highest.price_per_unit - lowestPrice,
                totalVariants: items.length
            }
        };
    });

    return highPriceIngredients;
  }

  async findOptimalIngredients(budget: number) {
    console.log(`Finding optimal ingredients for budget: ${budget}...`);
  
    // Fetch ingredients from database (using the lowest price variant of each)
    const lowPriceIngredients = await this.findLowPriceIngredients();
  
    // Create a list of all available ingredients with their lowest prices
    const availableIngredients = lowPriceIngredients.map(item => ({
      id: item.id,
      name: item.name,
      price: Number(item.price_per_unit),
      quantity: Number(item.quantity),
      valueRatio: Number(item.quantity) / Number(item.price_per_unit) // Higher ratio = better value
    }));
  
    // Configuration for diversity
    const MAX_BUDGET_PER_INGREDIENT_TYPE = 0.15; // 15% max for any one ingredient 
    
    // Sort ingredients by value ratio (quantity/price) in descending order
    availableIngredients.sort((a, b) => b.valueRatio - a.valueRatio);
  
    const optimalList = [];
    let remainingBudget = budget;
    
    // First pass: Try to include ALL ingredients with at least one unit
    for (const ingredient of availableIngredients) {
      if (ingredient.price <= remainingBudget) {
        // Add one unit of this ingredient
        optimalList.push({
          id: ingredient.id,
          name: ingredient.name,
          pricePerUnit: ingredient.price,
          quantityPerUnit: ingredient.quantity,
          units: 1,
          totalPrice: ingredient.price,
          totalQuantity: ingredient.quantity
        });
        
        remainingBudget -= ingredient.price;
      }
    }
  
    // Second pass: Distribute remaining budget among ingredients with a cap per ingredient type
    // Use a round-robin approach to ensure fair distribution
    let continueDistributing = true;
    while (continueDistributing && remainingBudget > 0) {
      continueDistributing = false;
      
      // Create a sorted copy of our existing ingredients list by value ratio
      const currentIngredients = [...optimalList].sort((a, b) => 
        (b.quantityPerUnit / b.pricePerUnit) - (a.quantityPerUnit / a.pricePerUnit)
      );
      
      for (const item of currentIngredients) {
        // Check if we've hit the budget cap for this ingredient
        const maxBudgetForIngredient = budget * MAX_BUDGET_PER_INGREDIENT_TYPE;
        const currentSpendOnIngredient = item.totalPrice;
        
        // Can we add more of this ingredient?
        if (currentSpendOnIngredient < maxBudgetForIngredient && 
            item.pricePerUnit <= remainingBudget) {
          // Add one more unit
          item.units += 1;
          item.totalPrice += item.pricePerUnit;
          item.totalQuantity += item.quantityPerUnit;
          
          remainingBudget -= item.pricePerUnit;
          continueDistributing = true;
          
          // Break after adding one item to give other ingredients a chance in the next round
          break;
        }
      }
    }
  
    // Third pass: Remove the cap and distribute any remaining budget
    // to get as close to 100% utilization as possible
    if (remainingBudget > 0) {
      let canContinue = true;
      while (canContinue && remainingBudget > 0) {
        canContinue = false;
        
        // Sort our current items by price (lowest first) to maximize units
        const sortedByPrice = [...optimalList].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
        
        for (const item of sortedByPrice) {
          if (item.pricePerUnit <= remainingBudget) {
            // Add one more unit
            item.units += 1;
            item.totalPrice += item.pricePerUnit;
            item.totalQuantity += item.quantityPerUnit;
            
            remainingBudget -= item.pricePerUnit;
            canContinue = true;
            break;
          }
        }
      }
    }
  
    // Sort the optimal list by total quantity (highest first) for presentation
    optimalList.sort((a, b) => b.totalQuantity - a.totalQuantity);
  
    // Calculate total quantities and cost
    const totalQuantity = optimalList.reduce((sum, item) => sum + item.totalQuantity, 0);
    const totalCost = budget - remainingBudget;
    
    return {
      ingredients: optimalList,
      summary: {
        totalIngredients: optimalList.length,
        totalUnits: optimalList.reduce((sum, item) => sum + item.units, 0),
        totalQuantity: totalQuantity,
        totalCost: totalCost,
        remainingBudget: remainingBudget,
        originalBudget: budget,
        budgetUtilizationPercentage: ((totalCost / budget) * 100).toFixed(2) + '%'
      }
    };
  }
  
}
