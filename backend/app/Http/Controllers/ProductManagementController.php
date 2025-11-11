<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Product;

class ProductManagementController extends Controller
{
    
    /**
     * Display a listing of the resource.
     * List all products
     */
    
    public function index()
    {
        return response()->json(Product::all(), 200);
    }

    /**
     * Store a newly created resource in storage.
     * Create a new product
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|unique:products',
            'description' => 'required',
            'price' => 'required|min:2',
            'stock_quantity' => 'required'
        ]);

         if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Continue if no errors
        $validated = $validator->validated();

        $product = Product::create($validated);

        // Log the restore
        InventoryLog::create([
            'product_id' => $product->id,
            'change_type' => 'restore',
            'quantity_change' => $request->stock_quantity,
            'reason' => 'Product Initial stock',
        ]);

        return response()->json([
            'success' => true,
            'data' => $product
        ], 201);

    }

    /**
     * Display the specified resource.
     * Show single product
     */
    public function show($id)
    {

        $product = Product::find($id);
            return $product
                ? response()->json($product, 200)
                : response()->json(['message' => 'Product not found'], 404);
    }

     /**
     * Update the specified resource in storage.
     * Update specific Product
     */
    public function update(Request $request, $id)
    {

        $item = Product::find($id);
        if(!$item) return response()->json(['message' => 'product not found'], 404);

        $item->update(array_merge(
            $request->only(['name', 'desc', 'description', 'price'])));
        return response()->json($item, 200);
    }

    /**
     * Update the specified resource in storage.
     * Update specific Product
     */
    public function updateStock(Request $request)
    {

        $validated = $request->validate([
            'product_id' => 'required|integer',
            'quantity' => 'required|integer',
        ]);

        $product = Product::findOrFail($request->product_id);
        $oldStock = $product->stock_quantity;

        // Update stock
        $product->stock_quantity += $request->quantity;
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

    /**
     * Remove the specified resource from storage.
     * Delete specific product
     */
    public function destroy($id)
    {

        $product = Product::find($id);
        if(!$product) return response()->json(['message' => 'product not found'], 400);

        $product->delete();
        return response()->json(['message' => 'product deleted'], 200);
    }

}
