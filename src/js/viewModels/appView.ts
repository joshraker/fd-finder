import * as ko from 'knockout';

import BaseView from 'viewModels/BaseView';

export class Depenedency {
    value: string = null;
    index: number = null; // index of first occurance

    constructor(value: string, index: number) {
        this.value = value;
        this.index = index;
    }
}

export class AppView extends BaseView {
    currentView: KnockoutObservable<BaseView> = ko.observable(null);
    inputFile: KnockoutObservable<File> = ko.observable(null);
    fileReader: FileReader = new FileReader();
    hasHeader: KnockoutObservable<Boolean> = ko.observable(true);
    highlight: KnockoutObservable<Boolean> = ko.observable(true);
    content: KnockoutObservable<string> = ko.observable('');
    headers: KnockoutObservableArray<string> = ko.observableArray([]);
    data: KnockoutComputed<Array<Array<string>>>;
    fds: KnockoutComputed<Array<Array<string>>>;
    deps: Array<Object> = [];

    constructor() {
        super('home.html');
        this.fileReader.onload = (e) => this.onFileLoad(e);

        this.data = ko.pureComputed((): Array<Array<string>> => {
            let data: Array<Array<string>> = [];
            let rows: Array<string> = this.content().split(/\n/);
            let headers: Array<string> = [];
            rows.pop(); // remove the empty final row

            rows.forEach((row) => {
                data.push(row.split(/,/));
            });

            if (this.hasHeader()) {
                headers = data.shift() || [];
            }
            else if (data.length) {
                for (let i = 0; i < data[0].length; i++) {
                    headers.push(`Attribute ${i + 1}`);
                }
            }

            this.headers(headers);

            return data;
        });

        this.fds = ko.pureComputed((): Array<Array<string>> => {
            let data = this.data();
            let length = data.length;
            let fds: Array<Array<string>> = [];

            if (length) {
                this.deps = [];

                for (let fdr = 0; fdr < length; fdr++) {
                    let fdRow = [];

                    for (let fdc = 0; fdc < data[fdr].length; fdc++) {
                        let deps = {};
                        let result = fdr === fdc ? '-' : 'true';

                        for (let i = 0; i < length && result === 'true'; i++) {
                            let key = data[i][fdr];
                            let value = data[i][fdc];
                            let dep = deps[key];

                            if (dep) {
                                if (value !== dep.value) {
                                    result = `${dep.index + 1}:${i + 1}`;
                                }
                            }
                            else {
                                deps[key] = new Depenedency(value, i);
                            }
                        }

                        fdRow.push(result);
                        this.deps.push(deps);
                    }

                    fds.push(fdRow);
                }
            }
            return fds;
        });
    }

    fileChanged(e: any) {
        let file: File = e.target.files[0];
        this.fileReader.readAsText(file);
    }

    onFileLoad(e: any) {
        this.content(e.target.result);
    }
}

export default new AppView();