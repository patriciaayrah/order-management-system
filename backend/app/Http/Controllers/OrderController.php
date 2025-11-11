<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     * List all orders
     */
    
    public function index()
    {
        return response()->json(Order::all(), 200);
    }

    /**
     * Store a newly created resource in storage.
     * Create a new order
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:created,confirmed,cancelled',
            'total_amount' => 'required|numeric|min:0',
            'order_number' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|numeric|min:1',
         ]);

         if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Generate order number if not provided
        $order_number = $validated['order_number'] ?? $this->generate_order_number();

        // Recalculate total_amount from the items (to ensure data integrity)
        $computed_total = 0;
        foreach ($validated['items'] as $item) {
            $computed_total += $item['unit_price'] * $item['quantity'];
        }

        // Create the order
        $order = Order::create([
            'order_number' => $order_number,
            'status' => $validated['status'],
            'total_amount' => $computed_total,
        ]);

        // Bulk insert all order items
        $orderItems = array_map(function ($item) use ($order) {
            return [
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'unit_price' => $item['unit_price'],
                'quantity' => $item['quantity'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }, $validated['items']);


        // Update stock or restore inventory depending on order status
        if ($order->status === 'created') {
            OrderItem::insert($orderItems);
        }else if ($order->status === 'confirmed') {
            $this->deductInventory($validated['items']);
        } elseif ($order->status === 'cancelled') {
            $this->restoreInventory($validated['items']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order processed successfully.',
        ], 201);
      
    }

    /**
     * Display the specified resource.
     * Show single order
     */
    public function show($id)
    {
        $order = Order::where('order_number', $id)->get();
            return $order
                ? response()->json($order, 200)
                : response()->json(['message' => 'Order not found'], 404);
    }

    /**
     * Generate Order Number
     */
    public function generate_order_number(){
        $date = now()->format('Ymd');
        $lastOrder = Order::latest('id')->first();
        $nextId = $lastOrder ? $lastOrder->id + 1 : 1;
        return $orderNumber = 'ORD-' . $date . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Deduct product stock when order is confirmed
     */
    protected function deductInventory(array $items)
    {
        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            if ($product) {
                $product->stock_quantity = max(0, $product->stock_quantity- $item['quantity']); // prevent negative
                $product->save();
            }
        }

    }

    /**
     * Restore product stock when order is cancelled
     */
    protected function restoreInventory(array $items)
    {
        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            if ($product) {
                $product->stock_quantity += $item['quantity'];
                $product->save();
            }
        }
    }

}
