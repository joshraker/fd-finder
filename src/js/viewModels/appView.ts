import * as ko from 'knockout';

import BaseView from 'viewModels/BaseView';

export class Value<T> {
    value: KnockoutObservable<T> = ko.observable(null);

    constructor(value: T = null) {
        this.value(value);
    }
}

export class Dependency {
    value: string = null;
    lastIndex: number = null; // index of last occurance of the key
    failIndex: number = null; // index of the key that conflicts

    constructor(value: string = null, startIndex: number = null) {
        this.value = value;
        this.lastIndex = startIndex;
    }

    display(): string {
        if (this.trivial()) {
            return '-';
        }

        // if failIndex is not defined the dependency exists
        return this.failIndex ? `${this.lastIndex + 1}:${this.failIndex + 1}` : 'true';
    }

    exists(): boolean {
        // trivials not included
        return this.failIndex === null;
    }

    trivial(): boolean {
        // if the two indices are defined and the same it's trivial
        return this.lastIndex !== null && this.lastIndex === this.failIndex;
    }
}

export class AppView extends BaseView {
    currentView: KnockoutObservable<BaseView> = ko.observable(null);
    inputFile: KnockoutObservable<File> = ko.observable(null);
    fileReader: FileReader = new FileReader();
    hasHeader: KnockoutObservable<boolean> = ko.observable(true);
    highlight: KnockoutObservable<boolean> = ko.observable(true);
    dataString: KnockoutObservable<string> = ko.observable('');
    data: KnockoutComputed<Array<Array<string>>>;
    headers: KnockoutObservableArray<string> = ko.observableArray([]);
    fds: KnockoutComputed<Array<Array<Dependency>>>;
    compositeFds: KnockoutComputed<Array<Dependency>>;
    lastIndex: KnockoutObservable<number> = ko.observable(null);
    failIndex: KnockoutObservable<number> = ko.observable(null);
    determinantIndices: KnockoutObservableArray<number> = ko.observableArray([]);
    dependentIndex: KnockoutObservable<number> = ko.observable(null);
    compositeIndices: KnockoutObservableArray<Value<number>> = ko.observableArray([]);
    unwrappedComposites: KnockoutComputed<Array<number>>;
    compositeVisible: KnockoutComputed<boolean>;

    constructor() {
        super('home.html');
        this.compositeIndices([new Value<number>(), new Value<number>()]);
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

        this.fds = ko.pureComputed((): Array<Array<Dependency>> => {
            let data = this.data();
            let fds: Array<Array<Dependency>> = [];

            if (data.length) {
                let length = this.headers().length;

                for (let fdr = 0; fdr < length; fdr++) {
                    // fdr = functional dependency row being checked
                    let fdRow: Array<Dependency> = [];

                    for (let fdc = 0; fdc < length; fdc++) {
                        // fdc = functional dependency column being checked
                        let deps = {};
                        let result: Dependency = new Dependency();

                        if (fdr === fdc) {
                            // trivial dependency
                            result.lastIndex = result.failIndex = -1;
                        }
                        else {
                            // non-trivial
                            for (let dr = 0; dr < data.length && result.failIndex === null; dr++) {
                                // dr = data row being checked
                                let key: string = data[dr][fdr];
                                let value: string = data[dr][fdc];
                                let dep: Dependency = deps[key];

                                if (dep) {
                                    if (value !== dep.value) {
                                        deps[key].failIndex = dr;
                                        result = deps[key];
                                    }
                                    else {
                                        deps[key].lastIndex = dr;
                                    }
                                }
                                else {
                                    deps[key] = new Dependency(value, dr);
                                }
                            }
                        }

                        fdRow.push(result);
                    }

                    fds.push(fdRow);
                }
            }
            return fds;
        });

        this.compositeFds = ko.pureComputed((): Array<Dependency> => {
            let data = this.data();
            let fds: Array<Dependency> = [];

            if (data.length) {
                let length = this.headers().length;

                for (let fdc = 0; fdc < length; fdc++) {
                    // fdc = functional dependency column being checked
                    let deps = {};
                    let result: Dependency = new Dependency();
                    let compositeIndices = this.compositeIndices();
                    let filterLength: number = compositeIndices.filter((index) => index.value() === fdc).length;

                    if (filterLength === 0) {
                        // non-trivial
                        for (let dr = 0; dr < data.length && result.failIndex === null; dr++) {
                            // dr = data row being checked
                            let key: string = '';

                            compositeIndices.forEach((index: Value<number>) => {
                                key += data[dr][index.value()] +  ' ';
                            });

                            let value: string = data[dr][fdc];
                            let dep: Dependency = deps[key];

                            if (dep) {
                                if (value !== dep.value) {
                                    deps[key].failIndex = dr;
                                    result = deps[key];
                                }
                                else {
                                    deps[key].lastIndex = dr;
                                }
                            }
                            else {
                                deps[key] = new Dependency(value, dr);
                            }
                        }
                    }
                    else {
                        // trivial dependency
                        result.lastIndex = result.failIndex = -1;
                    }

                    fds.push(result);
                }
            }
            return fds;
        });

        this.unwrappedComposites = ko.pureComputed((): Array<number> => {
            return this.compositeIndices().map((index): number => index.value());
        });

        this.compositeVisible = ko.pureComputed((): boolean => {
            return this.unwrappedComposites().filter((index: number): boolean => index > 0 || index === 0).length !== 0;
        });
    }

    fileChanged(e: any) {
        let file: File = e.target.files[0];
        this.fileReader.readAsText(file);
    }

    onFileLoad(e: any) {
        this.dataString(e.target.result);
    }

    depClick(dep: Dependency, dependentIndex: number = null, determinantIndices: Array<number> = []) {
        if (dep.failIndex !== null) {
            this.lastIndex(dep.lastIndex);
            this.failIndex(dep.failIndex);
            this.determinantIndices(determinantIndices);
            this.dependentIndex(dependentIndex);

            window.scrollTo(window.scrollX, 0);
        }
    }

    clearHighlight() {
        this.lastIndex(null);
        this.failIndex(null);
        this.determinantIndices([]);
        this.dependentIndex(null);
    }
}

export default new AppView();