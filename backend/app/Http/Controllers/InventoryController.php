<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use App\Models\Product;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        $inventory = InventoryLog::with(['product'])->get();
        return response()->json($inventory, 200);
    }

    /**
     * Display the specified resource.
     * Show single product
     */
    public function show($id)
    {

       $inventory = InventoryLog::with('product')
            ->where('product_id', $id)   // filter by product_id
            ->orderByDesc('created_at')  // descending order
            ->get();
            return $inventory
                ? response()->json($inventory, 200)
                : response()->json(['message' => 'Inventory not found'], 404);
    }

    /**
     * Update the specified resource in storage.
     * Update specific Product
     */
    public function store(Request $request)
    {

        $validated = $request->validate([
            'product_id' => 'required|integer',
            'quantity' => 'required|integer',
        ]);

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
    }

}
