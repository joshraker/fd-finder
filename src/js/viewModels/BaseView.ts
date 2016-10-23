import * as ko from 'knockout';

export abstract class BaseView {
    static TEMPLATE_PATH = 'templates/';

    page: KnockoutObservable<string> = ko.observable(null);
    url: KnockoutComputed<string>;

    constructor(page: string) {
        this.page(page);

        this.url = ko.pureComputed((): string => {
            return `${BaseView.TEMPLATE_PATH}${this.page()}`;
        });
    }
}

export default BaseView;