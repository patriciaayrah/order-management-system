<?php

use App\Http\Controllers\InventoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductManagementController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReportController;

//INVENTORY MODULE
Route::apiResource('products', ProductManagementController::class);
Route::apiResource('inventory-logs', InventoryController::class);

//ORDER MODULE
Route::apiResource('orders', OrderController::class);

//REPORT
Route::get('reports', [ReportController::class, 'index']);
