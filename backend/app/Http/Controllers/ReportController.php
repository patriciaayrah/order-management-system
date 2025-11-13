<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class ReportController extends Controller
{
    public function index()
    {

        try {

            // Total Orders Summary
            $totalOrders = Order::count();
            $cancelledOrders = Order::where('status', 'cancelled')->count();
            $confirmedOrders = Order::where('status', 'confirmed')->count();
            $createdOrders = Order::where('status', 'created')->count();

            // Revenue Calculations
            $totalConfirmed = Order::where('status', 'confirmed')->sum('total_amount');
            $totalRefund = Order::where('status', 'cancelled')->sum('total_amount');

            $totalRevenue = $totalConfirmed - $totalRefund;
            // Inventory Status Overview
            $totalProducts = Product::count();
            
            $lowStockProducts = Product::where('stock_quantity', '<', 5)->get(['id','name','stock_quantity']); // customize threshold
            $outOfStockProducts = Product::where('stock_quantity', 0)->get(['id','name','stock_quantity']);

            return response()->json([
                'orders_summary' => [
                    'total' => $totalOrders,
                    'created' => $createdOrders,
                    'confirmed' => $confirmedOrders,
                    'cancelled' => $cancelledOrders,
                ],
                'revenue' => [
                    'total_revenue' => $totalRevenue,
                ],
                'inventory' => [
                    'total_products' => $totalProducts,
                    'low_stock_count' => $lowStockProducts->count(),
                    'low_stock_products' => $lowStockProducts,
                    'out_of_stock_count' => $outOfStockProducts->count(),
                    'out_of_stock_products' => $outOfStockProducts,
                ]
            ]);
            
        }catch (Exception $e) {

            Log::error('Report generation failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report.',
                'error' => $e->getMessage(),
            ], 500);
        }
        
    }
    
}
