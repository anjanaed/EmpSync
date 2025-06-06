// import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Query } from '@nestjs/common';
// import { StockService } from './stock.service';
// import { Prisma } from '@prisma/client';

// @Controller('stock')
// export class StockController {
//     constructor(private readonly stockService: StockService) {}

//     @Post()
//     create(@Body() createStockDto: Prisma.StockCreateInput | Prisma.StockCreateInput[]) {
//         return this.stockService.create(createStockDto);
//     }

//     @Get()
//     findAll() {
//         return this.stockService.findAll();
//     }

//     @Get(':id')
//     findOne(@Param('id') id: number) {
//         return this.stockService.findOne(id);
//     }

//     @Patch(':id')
//     update(@Param('id') id: number, @Body() updateIngredientDto: Prisma.IngredientUpdateInput) {
//         return this.stockService.update(id, updateIngredientDto);
//     }

//     @Delete(':id')
//     remove(@Param('id') id: number) {
//         return this.stockService.remove(id);
//     }
// }