<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use App\Models\Product;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class InventoryController extends Controller
{
    public function index()
    {
        try {
            
            $inventory = InventoryLog::with(['product'])->get();
            return response()->json($inventory, 200);

        }catch (Exception $e) {
            
            Log::error('Failed to fetch inventory logs: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch inventory logs.'], 500);
        }
        
    }

    /**
     * Display the specified resource.
     * Show single inventory logs
     */
    public function show($id)
    {

        try {

            $inventory = InventoryLog::with('product')
            ->where('product_id', $id)   // filter by product_id
            ->orderByDesc('created_at')  // descending order
            ->get();
            return $inventory
                ? response()->json($inventory, 200)
                : response()->json(['message' => 'Inventory not found'], 404);

        }catch (Exception $e) {

            Log::error('Error fetching inventory logs: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to retrieve inventory logs.'], 500);

        }

       
    }

    /**
     * Update the specified resource in storage.
     * Update specific Product quantity
     */
    public function store(Request $request)
    {

         $validator = Validator::make($request->all(), [
            'product_id' => 'required|integer',
            'quantity' => 'required|integer',
         ]);

         if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {

            $product = Product::findOrFail($request->product_id);
            $oldStock = $product->stock_quantity;

            // Update stock
            $product->stock_quantity = $request->quantity;
            $product->save();

            // Determine change type and quantity difference
            $difference = $product->stock_quantity - $oldStock;

            if ($difference > 0) {
                $changeType = 'addition';
            } elseif ($difference < 0) {
                $changeType = 'deduction';
            } else {
                $changeType = 'no_change';
            }

            // Only log if stock actually changed
            if ($difference !== 0) {
                InventoryLog::create([
                    'product_id' => $product->id,
                    'change_type' => $changeType,
                    'quantity_change' => $difference,
                    'reason' => 'Manual '.$changeType . ' of stock',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Stock updated successfully.',
                'data' => [
                    'product' => $product,
                    'change_type' => $changeType,
                    'quantity_change' => $difference,
                ],
            ]);

        }catch (Exception $e) {

            Log::error('Failed to update stock: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update stock. Please try again later.',
            ], 500);

        }

        
    }

}
