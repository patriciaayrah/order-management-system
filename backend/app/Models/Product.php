<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
     protected $fillable = [
        'id',
        'name',
        'description',
        'price',
        'stock_quantity'
    ];

    public function inventoryLog()
    {
        return $this->hasMany(InventoryLog::class, 'product_id');
    }
}
