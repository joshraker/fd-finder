import * as ko from 'knockout';
import 'bindingHandlers';

import appView from 'viewModels/appView';
import router from 'router';

window['ko'] = ko;
window['appView'] = appView;

ko.applyBindings(appView);

router.run();