import * as ko from 'knockout';

/**
 * A binding handler that dynamically loads content into
 * the element it is bound to.
 * 
 * The binding handler expects the valueAccessor to be an
 * Object with a url parameter specifying the path to the
 * content that will be loaded into the element.
 * The url must be a string when unwrapped by knockout.
 * 
 * The valueAccessor will also be bound to the contents so
 * it can be a viewModel with a url property.
 * 
 * @example
 * // load the contents of home.html into a div
 * <div data-bind="templateLoad = { url: 'home.html' }"></div>
 */

ko.bindingHandlers['templateLoad'] = {
    init: (element, valueAccessor): void => {},
    update: (element, valueAccessor): void => {
        let viewModel = ko.unwrap(valueAccessor());

        if (viewModel) {
            // don't load content if there isn't data
            let url = ko.unwrap(viewModel.url);

            if (url) {
                // don't load content if there isn't a url
                $.ajax({
                    method: 'GET',
                    url: url,
                    success: (content): void => {
                        element.innerHTML = content;
                        ko.applyBindingsToDescendants(valueAccessor, element);
                    },
                    error: (err): void => {
                        console.error(new Error(`Template Load - ${err.status} ${err.statusText}`));
                    }
                });
            }
        }
    }
};