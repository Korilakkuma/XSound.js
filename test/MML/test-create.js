describe('MML TEST', function() {

    describe('MML.prototype.create', function() {

        it('should return "data:text/plain;base64,VDYyICBPMyAgUjE2IEExNiBCLTE2ICBPNCAgRDE2IEYxMiBBMTIgIE81ICBGMTIgQzImQzIuIFI0"', function() {
            expect(mml.create('T62  O3  R16 A16 B-16  O4  D16 F12 A12  O5  F12 C2&C2. R4')).toEqual('data:text/plain;base64,VDYyICBPMyAgUjE2IEExNiBCLTE2ICBPNCAgRDE2IEYxMiBBMTIgIE81ICBGMTIgQzImQzIuIFI0');
        });

        it('should return "data:text/plain;base64,JiMxMjM1NDsmIzEyMzU2OyYjMTIzNTg7JiMxMjM2MDsmIzEyMzYyOyBUNjIgIE8zICBSMTYgQTE2IEItMTYgIE80ICBEMTYgRjEyIEExMiAgTzUgIEYxMiBDMiZDMi4gUjQ="', function() {
            expect(mml.create('あいうえお T62  O3  R16 A16 B-16  O4  D16 F12 A12  O5  F12 C2&C2. R4')).toEqual('data:text/plain;base64,JiMxMjM1NDsmIzEyMzU2OyYjMTIzNTg7JiMxMjM2MDsmIzEyMzYyOyBUNjIgIE8zICBSMTYgQTE2IEItMTYgIE80ICBEMTYgRjEyIEExMiAgTzUgIEYxMiBDMiZDMi4gUjQ=');
        });

    });

});
