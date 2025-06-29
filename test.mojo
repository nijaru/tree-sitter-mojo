# Simple Mojo test file
from collections import List

struct Point:
    var x: Int
    var y: Int
    
    fn __init__(out self, x: Int, y: Int):
        self.x = x
        self.y = y
    
    fn distance(self, mut other: Point) -> Float64:
        var dx = self.x - other.x
        var dy = self.y - other.y
        return (dx * dx + dy * dy) ** 0.5

trait Drawable:
    fn draw(self):
        pass

fn main():
    var p1 = Point(0, 0)
    var p2 = Point(3, 4)
    var dist = p1.distance(p2)
    print(dist)

alias PI = 3.14159