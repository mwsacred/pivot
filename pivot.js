X.define('X.pivot.Pivot', {
    setData: function (data) {
        var resolutions = this.resolutions;
        var dom = this.dom;

        X.__intervalCheck();
        var resolver = new X.pivot.Resolver();
        var dm = resolver.resolve(resolutions, data);
        console.log("resolve : " + X.__intervalCheck());

        var vm = new X.pivot.ViewModel();
        vm.initVM(resolutions, dm);
        console.log("constructVM : " + X.__intervalCheck());

        var r = new X.pivot.Renderer(dom);
        r.render(vm);
    }
}, function (targetDom, resolution) {

    return {
        dom: targetDom,
        resolutions: resolution
    };
});