<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Exception;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     * List all orders
     */
    
    public function index()
    {

        try {

            $orders = Order::with(['orderItem.product'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->groupBy('order_number')
            ->map(function ($group) {

                // Sort statuses by updated_at ascending (chronological)
                $statuses = $group->map(function ($order) {
                    return [
                        'status' => $order->status,
                        'created_at' => $order->created_at,
                        'updated_at' => $order->updated_at
                    ];
                })
                ->sortBy('updated_at')
                ->values();

                // Take the latest status based on updated_at
                $latestStatus = $statuses->last();

                // Take first order for main info
                $mainOrder = $group->first();
                $mainOrder->status = $latestStatus['status'];
                $mainOrder->updated_at = $latestStatus['updated_at'];

                // Assign statuses array
                $mainOrder->statuses = $statuses;

                // Merge all order items
                $mainOrder->order_item = $group->pluck('order_item')->flatten()->values();

                return $mainOrder;
            })
            ->values();

            return response()->json($orders, 200);

        }catch (Exception $e) {

            Log::error('Failed to fetch orders: '.$e->getMessage());
            return response()->json(['error' => 'Unable to load orders'], 500);
        }   
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

        try {

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
                $this->deduct_inventory($validated['items']);
            } elseif ($order->status === 'cancelled') {
                $this->restore_inventory($validated['items']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order processed successfully.',
                'data' => $order
            ], 201);

        }catch (Exception $e) {

            Log::error('Order creation failed: '.$e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Order creation failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * Show single order
     */
    public function show($id)
    {
        try {

            $order = Order::with(['orderItem.product'])
                    ->where('order_number', $id)
                    ->first();

            return $order
                ? response()->json($order, 200)
                : response()->json(['message' => 'Order not found'], 404);

        }catch (Exception $e) {

            Log::error('Failed to load order: '.$e->getMessage());
            return response()->json(['error' => 'Failed to retrieve order'], 500);

        }
        
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
    protected function deduct_inventory(array $items)
    {
        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            if ($product) {
                $product->stock_quantity = max(0, $product->stock_quantity- $item['quantity']); // prevent negative
                $product->save();

                // Log the deduction
                InventoryLog::create([
                    'product_id' => $product->id,
                    'change_type' => 'deduction',
                    'quantity_change' => -$item['quantity'],
                    'reason' => 'Order confirmed: stock deducted.',
                ]);
            }
        }

    }

    /**
     * Restore product stock when order is cancelled
     */
    protected function restore_inventory(array $items)
    {
        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            if ($product) {
                $product->stock_quantity += $item['quantity'];
                $product->save();

                // Log the restore
                InventoryLog::create([
                    'product_id' => $product->id,
                    'change_type' => 'restore',
                    'quantity_change' => $item['quantity'],
                    'reason' => 'Order cancelled: stock restored.',
                ]);
            }
        }
    }

}
