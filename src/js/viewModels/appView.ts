import * as ko from 'knockout';

import BaseView from 'viewModels/BaseView';

export class AppView extends BaseView {
    currentView: KnockoutObservable<BaseView> = ko.observable(null);

    constructor() {
        super('home.html');
    }
}

export default new AppView();