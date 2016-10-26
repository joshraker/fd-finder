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
    dataString: KnockoutObservable<string> = ko.observable('');
    data: KnockoutComputed<Array<Array<string>>>;
    headers: KnockoutObservableArray<string> = ko.observableArray([]);
    fds: KnockoutComputed<Array<Array<string>>>;
    deps: Array<Object> = [];

    constructor() {
        super('home.html');
        this.fileReader.onload = (e) => this.onFileLoad(e);

        this.data = ko.pureComputed((): Array<Array<string>> => {
            // extract data from the dataString
            let data: Array<Array<string>> = [];
            let rowStrings: Array<string> = this.dataString().split(/\n/);
            let headers: Array<string> = [];
            rowStrings.pop(); // remove the empty final row

            rowStrings.forEach((rowString) => {
                let row: Array<string> = rowString.split(/,/);
                let start: number = -1;

                for (let i = 0; i < row.length; i++) {
                    // handle commas in entries
                    let entry: string = row[i];

                    if (entry[0] === '"') {
                        start = i;
                    }
                    else if (entry[entry.length - 1] === '"' && start > -1) {
                        // replace the entries that were split because of commas
                        let replace: string = row.slice(start, i + 1).join(','); // get string
                        replace = replace.slice(1, replace.length - 1); // remove quotes
                        row.splice(start, i - start + 1, replace); // replace entries
                        i = start; // adjust for replacing columns
                        start = -1;
                    }
                }

                data.push(row);
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
            let fds: Array<Array<string>> = [];

            if (data.length) {
                let length = this.headers().length;
                this.deps = [];

                for (let fdr = 0; fdr < length; fdr++) {
                    let fdRow = [];

                    for (let fdc = 0; fdc < length; fdc++) {
                        let deps = {};
                        let result = fdr === fdc ? '-' : 'true';

                        for (let i = 0; i < data.length && result === 'true'; i++) {
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
        this.dataString(e.target.result);
    }
}

export default new AppView();