<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InventoryLogSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('inventory_logs')->truncate();

        DB::table('inventory_logs')->insert([
            [
                'id' => 1,
                'product_id' => 1,
                'action' => 'Additions',
                'quantity' => 10,
                'remarks' => 'Product Initial stock',
                'created_at' => '2025-11-13 18:19:54',
                'updated_at' => '2025-11-13 18:19:54',
            ],
            [
                'id' => 2,
                'product_id' => 2,
                'action' => 'Additions',
                'quantity' => 10,
                'remarks' => 'Product Initial stock',
                'created_at' => '2025-11-13 18:20:19',
                'updated_at' => '2025-11-13 18:20:19',
            ],
            [
                'id' => 3,
                'product_id' => 3,
                'action' => 'Additions',
                'quantity' => 10,
                'remarks' => 'Product Initial stock',
                'created_at' => '2025-11-13 18:21:48',
                'updated_at' => '2025-11-13 18:21:48',
            ],
        ]);
    }
}
