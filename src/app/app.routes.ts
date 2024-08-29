import { HomePage } from './home/home.page';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { VisitorPageComponent } from './visitor-page/visitor-page.component';
import { NgModule } from '@angular/core';
import { SavedDetailsComponent } from './saved-details/saved-details.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: 'visitor-page',
    component: VisitorPageComponent,
  },

  {
    path: 'saved-details',
    component: SavedDetailsComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
