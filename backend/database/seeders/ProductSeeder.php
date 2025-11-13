<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('products')->truncate();

        DB::table('products')->insert([
            [
                'id' => 1,
                'name' => 'iPhone 17 Pro',
                'description' => 'Color - Orange',
                'price' => 79990.00,
                'quantity' => 10,
                'created_at' => '2025-11-13 18:19:54',
                'updated_at' => '2025-11-13 18:20:42',
            ],
            [
                'id' => 2,
                'name' => 'iPhone Air',
                'description' => 'Color - Blue',
                'price' => 72990.00,
                'quantity' => 10,
                'created_at' => '2025-11-13 18:20:19',
                'updated_at' => '2025-11-13 18:20:53',
            ],
            [
                'id' => 3,
                'name' => 'iPhone 17',
                'description' => 'Color - White',
                'price' => 57990.00,
                'quantity' => 10,
                'created_at' => '2025-11-13 18:21:48',
                'updated_at' => '2025-11-13 18:21:48',
            ],
        ]);
    }
}
