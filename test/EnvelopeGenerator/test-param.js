describe('EnvelopeGenerator TEST', function() {

    describe('EnvelopeGenerator.prototype.param', function() {

        describe('attack', function() {

            afterEach(function() {
                envelopegenerator.param('attack', 0.01);
            });

            // Getter
            // Positive

            it('should return 0.01', function() {
                expect(envelopegenerator.param('attack')).toEqual(0.01);
            });

            // Negative

            it('should return the instance of EnvelopeGenerator', function() {
                expect(envelopegenerator.param('')).toEqual(jasmine.any(EnvelopeGenerator));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                envelopegenerator.param('attack', 0.5);
                expect(envelopegenerator.param('attack')).toEqual(0.5);
            });

            it('should return 0', function() {
                envelopegenerator.param('attack', 0);
                expect(envelopegenerator.param('attack')).toEqual(0);
            });

            // Negative

            it('should return 0.01', function() {
                envelopegenerator.param('attack', -0.1);
                expect(envelopegenerator.param('attack')).toEqual(0.01);
            });

        });

        describe('decay', function() {

            afterEach(function() {
                envelopegenerator.param('decay', 0.3);
            });

            // Getter
            // Positive

            it('should return 0.3', function() {
                expect(envelopegenerator.param('decay')).toEqual(0.3);
            });

            // Negative

            it('should return the instance of EnvelopeGenerator', function() {
                expect(envelopegenerator.param('')).toEqual(jasmine.any(EnvelopeGenerator));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                envelopegenerator.param('decay', 0.5);
                expect(envelopegenerator.param('decay')).toEqual(0.5);
            });

            it('should return 0', function() {
                envelopegenerator.param('decay', 0);
                expect(envelopegenerator.param('decay')).toEqual(0);
            });

            // Negative

            it('should return 0.3', function() {
                envelopegenerator.param('decay', -0.1);
                expect(envelopegenerator.param('decay')).toEqual(0.3);
            });

        });

        describe('sustain', function() {

            afterEach(function() {
                envelopegenerator.param('sustain', 0.5);
            });

            // Getter
            // Positive

            it('should return 0.5', function() {
                expect(envelopegenerator.param('sustain')).toEqual(0.5);
            });

            // Negative

            it('should return the instance of EnvelopeGenerator', function() {
                expect(envelopegenerator.param('')).toEqual(jasmine.any(EnvelopeGenerator));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                envelopegenerator.param('sustain', 0.5);
                expect(envelopegenerator.param('sustain')).toEqual(0.5);
            });

            it('should return 0', function() {
                envelopegenerator.param('sustain', 0);
                expect(envelopegenerator.param('sustain')).toEqual(0);
            });

            // Negative

            it('should return 0.5', function() {
                envelopegenerator.param('sustain', -0.1);
                expect(envelopegenerator.param('sustain')).toEqual(0.5);
            });

        });

        describe('release', function() {

            afterEach(function() {
                envelopegenerator.param('release', 1);
            });

            // Getter
            // Positive

            it('should return 1', function() {
                expect(envelopegenerator.param('release')).toEqual(1);
            });

            // Negative

            it('should return the instance of EnvelopeGenerator', function() {
                expect(envelopegenerator.param('')).toEqual(jasmine.any(EnvelopeGenerator));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                envelopegenerator.param('release', 0.5);
                expect(envelopegenerator.param('release')).toEqual(0.5);
            });

            it('should return 0', function() {
                envelopegenerator.param('release', 0);
                expect(envelopegenerator.param('release')).toEqual(0);
            });

            // Negative

            it('should return 1', function() {
                envelopegenerator.param('release', -0.1);
                expect(envelopegenerator.param('release')).toEqual(1);
            });

        });

    });

});
