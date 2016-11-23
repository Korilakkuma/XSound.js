describe('Phaser TEST', function() {

    describe('Phaser.prototype.param', function() {

        describe('state', function() {

            afterEach(function() {
                phaser.param('stage', 12);
            });

            // Getter
            // Positive

            it('should return 12', function() {
                expect(phaser.param('stage')).toEqual(12);
            });

            // Negative

            it('should return the instance of Phaser', function() {
                expect(phaser.param('')).toEqual(jasmine.any(Phaser));
            });

            // Setter
            // Positive

            it('should return 0', function() {
                phaser.param('stage', 0);
                expect(phaser.param('stage')).toEqual(0);
            });

            it('should return 2', function() {
                phaser.param('stage', 2);
                expect(phaser.param('stage')).toEqual(2);
            });

            it('should return 4', function() {
                phaser.param('stage', 4);
                expect(phaser.param('stage')).toEqual(4);
            });

            it('should return 8', function() {
                phaser.param('stage', 8);
                expect(phaser.param('stage')).toEqual(8);
            });

            it('should return 12', function() {
                phaser.param('stage', 12);
                expect(phaser.param('stage')).toEqual(12);
            });

            it('should return 24', function() {
                phaser.param('stage', 24);
                expect(phaser.param('stage')).toEqual(24);
            });

            // Negative

            it('should return 12', function() {
                phaser.param('stage', 48);
                expect(phaser.param('stage')).toEqual(12);
            });

        });

        describe('frequency', function() {

            afterEach(function() {
                phaser.param('frequency', 350);
            });

            // Getter
            // Positive

            it('should return 350', function() {
                expect(phaser.param('frequency')).toEqual(350);
            });

            // Negative

            it('should return the instance of Phaser', function() {
                expect(phaser.param('')).toEqual(jasmine.any(Phaser));
            });

            // Setter
            // Positive

            it('should return 350.5', function() {
                phaser.param('frequency', 350.5);
                expect(phaser.param('frequency')).toEqual(350.5);
            });

            it('should return the Nyquist frequency (half the sample-rate)', function() {
                phaser.param('frequency', (audiocontext.sampleRate / 2));
                expect(phaser.param('frequency')).toEqual(audiocontext.sampleRate / 2);
            });

            it('should return 10', function() {
                phaser.param('frequency', 10);
                expect(phaser.param('frequency')).toEqual(10);
            });

            // Negative

            it('should return 350', function() {
                phaser.param('frequency', ((audiocontext.sampleRate / 2) + 0.1));
                expect(phaser.param('frequency')).toEqual(350);
            });

            it('should return 350', function() {
                phaser.param('frequency', 9.9);
                expect(phaser.param('frequency')).toEqual(350);
            });

        });

        describe('resonance', function() {

            afterEach(function() {
                phaser.param('resonance', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(phaser.param('resonance')).toEqual(1);
            });

            // Negative

            it('should return the instance of Phaser', function() {
                expect(phaser.param('')).toEqual(jasmine.any(Phaser));
            });

            // Setter
            // Positive

            it('should return 1000', function() {
                phaser.param('resonance', 1000);
                expect(phaser.param('resonance')).toEqual(1000);
            });

            it('should return 0.00009999999747378752', function() {
                phaser.param('resonance', 0.0001);
                expect(phaser.param('resonance')).toEqual(0.00009999999747378752);
            });

            // Negative

            it('should return 1', function() {
                phaser.param('resonance', 1000.1);
                expect(phaser.param('resonance')).toEqual(1);
            });

            it('should return 1', function() {
                phaser.param('resonance', 0.00009999);
                expect(phaser.param('resonance')).toEqual(1);
            });

        });

        describe('depth', function() {

            afterEach(function() {
                phaser.param('depth', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(phaser.param('depth')).toEqual(0);
            });

            // Negative

            it('should return the instance of Phaser', function() {
                expect(phaser.param('')).toEqual(jasmine.any(Phaser));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                phaser.param('depth', 0.5);
                expect(phaser.param('depth')).toEqual(0.5);
            });

            it('should return 1', function() {
                phaser.param('depth', 1);
                expect(phaser.param('depth')).toEqual(1);
            });

            it('should return 0', function() {
                phaser.param('depth', 0);
                expect(phaser.param('depth')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                phaser.param('depth', 1.1);
                expect(phaser.param('depth')).toEqual(0);
            });

            it('should return 0', function() {
                phaser.param('depth', -0.1);
                expect(phaser.param('depth')).toEqual(0);
            });

        });

        describe('rate', function() {

            afterEach(function() {
                phaser.param('rate', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(phaser.param('rate')).toEqual(0);
            });

            // Negative

            it('should return the instance of Phaser', function() {
                expect(phaser.param('')).toEqual(jasmine.any(Phaser));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                phaser.param('rate', 0.5);
                expect(phaser.param('rate')).toEqual(0.5);
            });

            it('should return 100000', function() {
                phaser.param('rate', 100000);
                expect(phaser.param('rate')).toEqual(100000);
            });

            it('should return 0', function() {
                phaser.param('rate', 0);
                expect(phaser.param('rate')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                phaser.param('rate', 100000.1);
                expect(phaser.param('rate')).toEqual(0);
            });

            it('should return 0', function() {
                phaser.param('rate', -0.1);
                expect(phaser.param('rate')).toEqual(0);
            });

        });

        describe('mix', function() {

            afterEach(function() {
                phaser.param('mix', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(phaser.param('mix')).toEqual(0);
            });

            // Negative

            it('should return the instance of Phaser', function() {
                expect(phaser.param('')).toEqual(jasmine.any(Phaser));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                phaser.param('mix', 0.5);
                expect(phaser.param('mix')).toEqual(0.5);
            });

            it('should return 1', function() {
                phaser.param('mix', 1);
                expect(phaser.param('mix')).toEqual(1);
            });

            it('should return 0', function() {
                phaser.param('mix', 0);
                expect(phaser.param('mix')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                phaser.param('mix', 1.1);
                expect(phaser.param('mix')).toEqual(0);
            });

            it('should return 0', function() {
                phaser.param('mix', -0.1);
                expect(phaser.param('mix')).toEqual(0);
            });

        });

        describe('feedback', function() {

            afterEach(function() {
                phaser.param('feedback', 0);
            });

            // Getter
            // Positive

            it('should return 0', function() {
                expect(phaser.param('feedback')).toEqual(0);
            });

            // Negative

            it('should return the instance of Phaser', function() {
                expect(phaser.param('')).toEqual(jasmine.any(Phaser));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                phaser.param('feedback', 0.5);
                expect(phaser.param('feedback')).toEqual(0.5);
            });

            it('should return 1', function() {
                phaser.param('feedback', 1);
                expect(phaser.param('feedback')).toEqual(1);
            });

            it('should return 0', function() {
                phaser.param('feedback', 0);
                expect(phaser.param('feedback')).toEqual(0);
            });

            // Negative

            it('should return 0', function() {
                phaser.param('feedback', 1.1);
                expect(phaser.param('feedback')).toEqual(0);
            });

            it('should return 0', function() {
                phaser.param('feedback', -0.1);
                expect(phaser.param('feedback')).toEqual(0);
            });

        });

    });

});
