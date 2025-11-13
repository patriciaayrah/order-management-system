<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Exception;


class ProductManagementController extends Controller
{
    
    /**
     * Display a listing of the resource.
     * List all products
     */
    
    public function index()
    {

        try {
            
            return response()->json(Product::all(), 200);

        }catch (Exception $e) {

            Log::error('Failed to fetch products: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to load products.'
            ], 500);

        }

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

        try {

            $product = Product::create($validated);

            // Log the Inventory
            InventoryLog::create([
                'product_id' => $product->id,
                'change_type' => 'Additions',
                'quantity_change' => $request->stock_quantity,
                'reason' => 'Product Initial stock',
            ]);

            return response()->json([
                'success' => true,
                'data' => $product
            ], 201);

        }catch (Exception $e) {

            Log::error('Product creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product.',
            ], 500);

        }

    }

    /**
     * Display the specified resource.
     * Show single product
     */
    public function show($id)
    {

        try {
             $product = Product::find($id);
            return $product
                ? response()->json($product, 200)
                : response()->json(['message' => 'Product not found'], 404);
                
        }catch (Exception $e) {

            Log::error('Failed to fetch product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving product.'
            ], 500);

        }

       
    }

     /**
     * Update the specified resource in storage.
     * Update specific Product
     */
    public function update(Request $request, $id)
    {

         $validator = Validator::make($request->all(), [
            'name'           => 'sometimes|string|max:255|unique:products,name,' . $id,
            'description'    => 'sometimes|string|min:5',
            'price'          => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {

             $item = Product::find($id);
            if(!$item) return response()->json(['message' => 'product not found'], 404);

            $item->update(array_merge(
                $request->only(['name', 'desc', 'description', 'price'])));
            return response()->json($item, 200);
            
        }catch (Exception $e) {

            Log::error('Product update failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating product.',
            ], 500);
        }

    }

    /**
     * Remove the specified resource from storage.
     * Delete specific product
     */
    public function destroy($id)
    {
        try {

            $product = Product::find($id);
            if(!$product) return response()->json(['message' => 'product not found'], 400);

            $product->delete();
            return response()->json(['message' => 'product deleted'], 200);

        }catch (Exception $e) {

            Log::error('Product deletion failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting product.'
            ], 500);
            
        }
    }

}
