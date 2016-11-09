describe('TimeOverview TEST', function() {

    describe('TimeOverview.prototype.param', function() {

        describe('currentTime', function() {

            afterEach(function() {
                timeOverview.param('currentTime', 'rgba(255, 255, 255, 1.0)');
            });

            // Getter
            // Positive

            it('should return "rgba(255, 255, 255, 1.0)"', function() {
                expect(timeOverview.param('currentTime')).toEqual('rgba(255, 255, 255, 1.0)');
            });

            // Negative

            it('should return the instance of TimeOverview', function() {
                expect(timeOverview.param('')).toEqual(jasmine.any(TimeOverview));
            });

            // Setter

            it('should return #cc0000', function() {
                timeOverview.param('currentTime', '#cc0000');
                expect(timeOverview.param('currentTime')).toEqual('#cc0000');
            });

        });

        describe('plotInterval', function() {

            afterEach(function() {
                timeOverview.param('plotInterval', 0.0625);
            });

            // Getter
            // Positive

            it('should return 0.0625', function() {
                expect(timeOverview.param('plotInterval')).toEqual(0.0625);
            });

            // Negative

            it('should return the instance of TimeOverview', function() {
                expect(timeOverview.param('')).toEqual(jasmine.any(TimeOverview));
            });

            // Setter
            // Positive

            it('should return 0.05', function() {
                timeOverview.param('plotInterval', 0.05);
                expect(timeOverview.param('plotInterval')).toEqual(0.05);
            });

            // Negative

            it('should return 0.0625', function() {
                timeOverview.param('plotInterval', 0);
                expect(timeOverview.param('plotInterval')).toEqual(0.0625);
            });

        });

        describe('textInterval', function() {

            afterEach(function() {
                timeOverview.param('textInterval', 60);
            });

            // Getter
            // Positive

            it('should return 60', function() {
                expect(timeOverview.param('textInterval')).toEqual(60);
            });

            // Negative

            it('should return the instance of TimeOverview', function() {
                expect(timeOverview.param('')).toEqual(jasmine.any(TimeOverview));
            });

            // Setter
            // Positive

            it('should return 0.5', function() {
                timeOverview.param('textInterval', 0.5);
                expect(timeOverview.param('textInterval')).toEqual(0.5);
            });

            // Negative

            it('should return 60', function() {
                timeOverview.param('textInterval', 0);
                expect(timeOverview.param('textInterval')).toEqual(60);
            });

        });

    });

});
