import { Component, OnInit } from '@angular/core';
import { IFaqQuestions } from '@shared/interfaces/others.model';
import { FAQs } from '@shared/web-content/FAQs';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss'],
})
export class FaqsComponent implements OnInit {

  readonly content: IFaqQuestions[] = FAQs;

  constructor(
  ) { }

  ngOnInit(): void { }
}
