import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class IngredientsService {
  constructor(private readonly databaseServices: DatabaseService) {}

  async create(
    createIngredientDto: Prisma.IngredientCreateInput | Prisma.IngredientCreateInput[]
  ) {
    try {
      if (Array.isArray(createIngredientDto)) {
        const formattedData = createIngredientDto.map(ingredient => ({
          ...ingredient,
        }));

        return await this.databaseServices.ingredient.createMany({
          data: formattedData,
          skipDuplicates: true // optional: prevent unique constraint errors
        });
      }

      const formattedSingle = {
        ...createIngredientDto,
      };

      return await this.databaseServices.ingredient.create({
        data: formattedSingle
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

  async findOne(id: number) {
    // id is converted to number
    const parsedId = parseInt(id.toString(), 10);
    
    if (isNaN(parsedId)) {
      throw new HttpException('Invalid ingredient ID', HttpStatus.BAD_REQUEST);
    }

    const ingredient = await this.databaseServices.ingredient.findUnique({
      where: { id: parsedId }
    });

    if (!ingredient) {
      throw new HttpException('Ingredient Not found', HttpStatus.NOT_FOUND);
    }
    return ingredient;
  }

  async update(id: number, updateIngredientDto: Prisma.IngredientUpdateInput) {
    // The findOne method will now handle the id parsing
    const ingredient = await this.findOne(id);
    
    return this.databaseServices.ingredient.update({
      where: { id: parseInt(id.toString(), 10) },
      data: updateIngredientDto,
    });
  }

  async remove(id: number) {
    // The findOne method already handles ID validation and type conversion
    const ingredient = await this.findOne(id);
    
    try {
      // First delete all related MealIngredient records
      await this.databaseServices.mealIngredient.deleteMany({
        where: {
          ingredientId: parseInt(id.toString(), 10)
        }
      });

      // Then delete the ingredient
      return await this.databaseServices.ingredient.delete({
        where: { id: parseInt(id.toString(), 10) },
      });
    } catch (error) {
      throw new HttpException(
        'Failed to delete ingredient',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByOrgId(orgId: string) {
    if (!orgId || typeof orgId !== 'string') {
      throw new HttpException('Invalid organization ID', HttpStatus.BAD_REQUEST);
    }

    const ingredients = await this.databaseServices.ingredient.findMany({
      where: {
        orgId: orgId,
      },
    });

    if (!ingredients || ingredients.length === 0) {
      throw new HttpException('No ingredients found for the organization', HttpStatus.NOT_FOUND);
    }

    return ingredients;
  }

  // async getIngredientStats() {
  //   const allIngredients = await this.databaseServices.ingredient.findMany({
  //     select: {
  //       id: true,
  //       priority: true
  //     }
  //   });

  //   const totalCount = allIngredients.length;
    
  //   // Count ingredients by priority
  //   const priorityCount = allIngredients.reduce((acc, ingredient) => {
  //     const priority = ingredient.priority || 'NORMAL'; // Default to NORMAL if priority is null
  //     acc[priority] = (acc[priority] || 0) + 1;
  //     return acc;
  //   }, {} as Record<string, number>);

  //   return {
  //     totalCount,
  //     priorityCount,
  //     lastUpdated: new Date()
  //   };
  // }

  // async getAdvancedIngredientStats() {
  //   const ingredients = await this.databaseServices.ingredient.findMany({
  //     select: {
  //       id: true,
  //       name: true,
  //       priority: true,
  //       type: true,
  //       price_per_unit: true
  //     }
  //   });

  //   // Group ingredients by priority and type
  //   const groupedStats = ingredients.reduce((acc, ingredient) => {
  //     const priority = ingredient.priority || 'NORMAL';
  //     const type = ingredient.type || 'UNDEFINED';

  //     if (!acc[priority]) {
  //       acc[priority] = { types: {} };
  //     }
  //     if (!acc[priority].types[type]) {
  //       acc[priority].types[type] = [];
  //     }

  //     acc[priority].types[type].push(ingredient);
  //     return acc;
  //   }, {} as Record<string, { types: Record<string, any[]> }>);

  //   //  binary search function for finding price ranges
  //   function binarySearchPriceRange(items: any[]) {
  //     if (!items.length) return null;

  //     // Sort items by price_per_unit
  //     items.sort((a, b) => a.price_per_unit - b.price_per_unit);

  //     // Binary search for lowest price
  //     let low = 0, high = items.length - 1;
  //     let minPrice = items[0].price_per_unit;
  //     while (low < high) {
  //       let mid = Math.floor((low + high) / 2);
  //       if (items[mid].price_per_unit > minPrice) {
  //         high = mid;
  //       } else {
  //         low = mid + 1;
  //       }
  //     }
  //     let lowest = items[0].price_per_unit; // Use first item after sorting

  //     // Binary search for highest price
  //     low = 0;
  //     high = items.length - 1;
  //     let highest = items[items.length - 1].price_per_unit; // Use last item after sorting

  //     return {
  //       lowest,
  //       highest,
  //       count: items.length
  //     };
  //   }

  //   // Process each group to get price statistics using the new binary search
  //   const finalStats = Object.entries(groupedStats).reduce((acc, [priority, data]) => {
  //     acc[priority] = {
  //       types: Object.entries(data.types).reduce((typeAcc, [type, items]) => {
  //         typeAcc[type] = binarySearchPriceRange(items);
  //         return typeAcc;
  //       }, {}),
  //       totalCount: Object.values(data.types).flat().length
  //     };
  //     return acc;
  //   }, {} as Record<string, any>);

  //   return {
  //     statistics: finalStats,
  //     lastUpdated: new Date(),
  //     totalIngredients: ingredients.length
  //   };
  // }

  // async getMonthlyIngredientStats(year?: number) {
  //   try {
  //     const targetYear = year || new Date().getFullYear();

  //     const ingredients = await this.databaseServices.ingredient.findMany({
  //       select: {
  //         id: true,
  //         name: true,
  //         price_per_unit: true,
  //         quantity: true,
  //         priority: true,
  //         type: true,        
  //         createdAt: true,
  //       },
  //       where: {
  //         createdAt: {
  //           gte: new Date(targetYear, 0, 1),
  //           lt: new Date(targetYear + 1, 0, 1)
  //         }
  //       }
  //     });

  //     if (!ingredients || ingredients.length === 0) {
  //       throw new HttpException(
  //         `No ingredients found for year ${targetYear}`,
  //         HttpStatus.NOT_FOUND
  //       );
  //     }

  //     const monthlyStats = Array(12).fill(null).map(() => ({
  //       count: 0,
  //       totalValue: 0 as number,
  //       byPriority: {} as Record<string, number>,
  //       byType: {} as Record<string, number>,    // Added type tracking
  //       ingredients: [] as any[],                 // Will store detailed ingredient info
  //       priceRange: {
  //         highest: 0,
  //         lowest: Infinity
  //       }
  //     }));

  //     ingredients.forEach(ingredient => {
  //       const month = ingredient.createdAt.getMonth();
  //       const stats = monthlyStats[month];
  //       const price = Number(ingredient.price_per_unit);

  //       // Update basic stats
  //       stats.count++;
  //       stats.totalValue += price * Number(ingredient.quantity);
        
  //       // Update price range
  //       stats.priceRange.highest = Math.max(stats.priceRange.highest, price);
  //       stats.priceRange.lowest = Math.min(stats.priceRange.lowest, price);
        
  //       // Add detailed ingredient information
  //       stats.ingredients.push({
  //         id: ingredient.id,
  //         name: ingredient.name,
  //         type: ingredient.type || 'UNDEFINED',
  //         price: price,
  //         quantity: ingredient.quantity,
  //         priority: ingredient.priority || 'NORMAL',
  //         createdAt: ingredient.createdAt,
  //         totalValue: price * Number(ingredient.quantity)
  //       });

  //       // Update priority counts
  //       const priority = ingredient.priority || 'NORMAL';
  //       stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

  //       // Update type counts
  //       const type = ingredient.type || 'UNDEFINED';
  //       stats.byType[type] = (stats.byType[type] || 0) + 1;
  //     });

  //     const months = [
  //       'January', 'February', 'March', 'April', 'May', 'June',
  //       'July', 'August', 'September', 'October', 'November', 'December'
  //     ];

  //     const formattedStats = monthlyStats.map((stats, index) => ({
  //       month: months[index],
  //       statistics: {
  //         totalIngredients: stats.count,
  //         totalInventoryValue: Number(stats.totalValue.toFixed(2)),
  //         priorityDistribution: stats.byPriority,
  //         typeDistribution: stats.byType,
  //         averageValuePerIngredient: stats.count > 0 
  //           ? Number((stats.totalValue / stats.count).toFixed(2)) 
  //           : 0,
  //         priceRange: {
  //           highest: stats.count > 0 ? Number(stats.priceRange.highest.toFixed(2)) : 0,
  //           lowest: stats.count > 0 ? Number(stats.priceRange.lowest.toFixed(2)) : 0
  //         }
  //       },
  //       ingredients: stats.ingredients.sort((a, b) => b.totalValue - a.totalValue) // Sort by total value
  //     }));

  //     const yearlyPriceRange = ingredients.reduce((range, ingredient) => {
  //       const price = Number(ingredient.price_per_unit);
  //       return {
  //         highest: Math.max(range.highest, price),
  //         lowest: Math.min(range.lowest, price)
  //       };
  //     }, { highest: 0, lowest: Infinity });

  //     return {
  //       year: targetYear,
  //       monthlyStatistics: formattedStats,
  //       totalYearlyIngredients: ingredients.length,
  //       summary: {
  //         totalValue: formattedStats.reduce((sum, month) => sum + month.statistics.totalInventoryValue, 0),
  //         averageMonthlyIngredients: Math.round(ingredients.length / formattedStats.filter(m => m.statistics.totalIngredients > 0).length),
  //         mostActiveMonth: formattedStats.reduce((max, curr) => 
  //           curr.statistics.totalIngredients > (max?.statistics.totalIngredients || 0) ? curr : max, null)?.month,
  //         priceRange: {
  //           highest: Number(yearlyPriceRange.highest.toFixed(2)),
  //           lowest: yearlyPriceRange.lowest !== Infinity ? Number(yearlyPriceRange.lowest.toFixed(2)) : 0
  //         }
  //       },
  //       lastUpdated: new Date()
  //     };
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       throw error;
  //     }
  //     throw new HttpException(
  //       'Failed to get monthly ingredient statistics',
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  // async getOptimizedIngredients(targetMonth?: number, targetYear?: number) {
  //   try {
  //     // Set default to current month if not specified
  //     const now = new Date();
  //     const month = targetMonth ?? now.getMonth();
  //     const year = targetYear ?? now.getFullYear();

  //     // Calculate start and end dates for the target month
  //     const startDate = new Date(year, month, 1);
  //     const endDate = new Date(year, month + 1, 0);

  //     // Get ingredients for the specified month
  //     const ingredients = await this.databaseServices.ingredient.findMany({
  //       select: {
  //         id: true,
  //         name: true,
  //         price_per_unit: true,
  //         quantity: true,
  //         type: true,
  //         priority: true,
  //         createdAt: true
  //       },
  //       where: {
  //         createdAt: {
  //           gte: startDate,
  //           lte: endDate
  //         }
  //       },
  //       orderBy: {
  //         createdAt: 'desc'
  //       }
  //     });

  //     // Separate priority 1 ingredients
  //     const priority1Ingredients = ingredients
  //       .filter(ing => ing.priority === 1)
  //       .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  //     // Group other priority ingredients by type
  //     const otherPriorityIngredients = ingredients
  //       .filter(ing => ing.priority !== 1)
  //       .reduce((acc, ing) => {
  //         if (!acc[ing.type]) {
  //           acc[ing.type] = [];
  //         }
  //         acc[ing.type].push(ing);
  //         return acc;
  //       }, {} as Record<string, any[]>);

  //     // Get lowest price ingredient for each type
  //     const minPriceIngredients = Object.entries(otherPriorityIngredients).map(([type, ings]) => {
  //       return ings.reduce((min, current) => {
  //         return Number(current.price_per_unit) < Number(min.price_per_unit) ? current : min;
  //       }, ings[0]);
  //     });

  //     return {
  //       priority1Ingredients,
  //       optimizedIngredients: minPriceIngredients,
  //       lastUpdated: new Date()
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       'Failed to get optimized ingredients',
  //       HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }
}