import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { TaskComponent } from './components/task/task.component';
import { TaskDialogComponent } from './components/task-dialog/task-dialog.component';
import { environment } from '../environments/environment';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { TaskStackComponent } from './components/task-stack/task-stack.component';
import { AppRoutingModule } from './app-routing.module';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { BoardPageComponent } from './pages/board-page/board-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { LayoutComponent } from './components/layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { MainContentComponent } from './components/main-content/main-content.component';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FooterComponent } from './components/footer/footer.component';
import { BoardDialogComponent } from './components/board-dialog/board-dialog.component';
import { BoardCardComponent } from './components/board-card/board-card.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,

    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    provideStorage(() => getStorage()),

    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    DragDropModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatSidenavModule,
    AppRoutingModule,
  ],
  declarations: [
    AppComponent,
    TaskComponent,
    TaskDialogComponent,
    TaskStackComponent,
    MainPageComponent,
    BoardPageComponent,
    NotFoundPageComponent,
    LayoutComponent,
    SidebarComponent,
    HeaderComponent,
    MainContentComponent,
    FooterComponent,
    BoardDialogComponent,
    BoardCardComponent,
    ConfirmDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }