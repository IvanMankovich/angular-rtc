import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-board-page',
  templateUrl: './board-page.component.html',
  styleUrls: ['./board-page.component.css']
})
export class BoardPageComponent implements OnInit {
  title = 'Board';
  loading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const routeParams = this.activatedRoute.snapshot.paramMap;
    const boardIdFromRoute = routeParams.get('boardId') || '';
    this.loading = true;
    if (!boardIdFromRoute) {
      this.loading = false;
      this.router.navigate(['/']);
    }
  }
}
