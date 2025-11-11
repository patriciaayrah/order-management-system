<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Order;
use App\Models\OrderItem;

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
            'status' => 'required|string',
            'total_amount' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            // Return the validation errors
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        
        $order_number = $request->order_number;
        
        if(empty($order_number)){
           $order_number = $this->generate_order_number();
        }
    
        // Continue if no errors
        $validated = $validator->validated();

        $validated = array_merge($validated, [
            'order_number' => $order_number
        ]);


        $order = Order::create($validated);

        return response()->json([
            'success' => true,
            'data' => $order
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

    public function generate_order_number(){
         // Generate order number
        $date = now()->format('Ymd');
        $lastOrder = Order::latest('id')->first();
        $nextId = $lastOrder ? $lastOrder->id + 1 : 1;
        return $orderNumber = 'ORD-' . $date . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
    }

}
