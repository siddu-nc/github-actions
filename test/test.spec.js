const add = require('../index.js');
describe("A unit testing suite for checking additional functionality",function(){
 
 it("Addition of two positive numbers",function(){
   expect(add(2,3)).toBe(5)
 });

 it("Additions of two negative numbers", function(){
   expect(add(-1,-2)).not.toBe(0);
 });

});