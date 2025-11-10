<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductManagementController;

//INVENTORY MODULE
    Route::apiResource('products', ProductManagementController::class);