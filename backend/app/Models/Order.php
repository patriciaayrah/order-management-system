<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'id',
        'order_number',
        'status',
        'total_amount',
    ];

      // Reverse relation
    public function orderItem()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }
}
