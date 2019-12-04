import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
ROUTE_IMPORT_CLASES

const routes: Routes = [
		ROUTES_DECLARATION
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
