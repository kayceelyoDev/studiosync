<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in(__DIR__.'/Feature');

if (getcwd() && realpath(getcwd()) !== realpath(__DIR__.'/..')) {
    $worktreeApp = getcwd().'/app/';
    if (is_dir($worktreeApp)) {
        spl_autoload_register(function (string $class) use ($worktreeApp): void {
            if (str_starts_with($class, 'App\\')) {
                $path = $worktreeApp.str_replace('\\', '/', substr($class, 4)).'.php';
                if (file_exists($path)) {
                    require_once $path;
                }
            }
        }, true, true);
    }
    if (file_exists(getcwd().'/tests/Pest.php')) {
        require_once getcwd().'/tests/Pest.php';
    }
}

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

if (! function_exists('something')) {
    function something()
    {
        // ..
    }
}
