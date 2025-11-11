<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    protected $fillable = [
        'id',
        'product_id',
        'change_type',
        'quantity_change',
        'reason'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
