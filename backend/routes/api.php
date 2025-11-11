<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductManagementController;
use App\Http\Controllers\OrderController;

//INVENTORY MODULE
Route::apiResource('products', ProductManagementController::class);
//ORDER MODULE
Route::apiResource('orders', OrderController::class);