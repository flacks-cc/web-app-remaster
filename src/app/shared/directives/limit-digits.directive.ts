import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appLimitDigits]',
  standalone: true
})
export class LimitDigitsDirective {
  @Input() appLimitDigits: string = '4';

  constructor(private elementRef: ElementRef) { }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const value = this.elementRef.nativeElement.value;
    if (value && value.length > this.appLimitDigits) {
      const newValue = parseFloat(value.substring(0, this.appLimitDigits));
      this.elementRef.nativeElement.value = newValue.toString();
    }
  }
}
