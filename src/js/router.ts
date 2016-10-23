import * as Sammy from 'sammy';

import appView from 'viewModels/appView';

let router: Sammy.Application = Sammy();

router.get(/.*/, (): void => {
    // "defaut" route
    appView.currentView(appView);
});

export default router;