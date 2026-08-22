import type { BookingService } from '../shared/portfolio-shell';

export interface BookingData {
  name: string;
  service: string;
  date: string;
  brief: string;
}

const clean = (value: string, fallback: string) => value.trim() || fallback;

const bookingServices = Object.freeze([
  'Фотосессия',
  'Видеосъёмка',
  'AI-проект',
  'Музыка',
] as const);

const isBookingService = (value: string): value is BookingService =>
  bookingServices.some((service) => service === value);

export function readBookingService(search: string): BookingService | null {
  const service = new URLSearchParams(search).get('service');
  return service && isBookingService(service) ? service : null;
}

export function buildTelegramUrl(data: BookingData): string {
  const message = [
    'Здравствуйте, Василий!',
    `Меня зовут ${clean(data.name, 'не указано')}.`,
    `Интересует: ${clean(data.service, 'другое')}.`,
    `Желаемая дата: ${clean(data.date, 'пока не определена')}.`,
    `Задача: ${clean(data.brief, 'хочу обсудить детали')}`,
  ].join('\n');

  return `https://t.me/wasiliy12777?text=${encodeURIComponent(message)}`;
}

export function initBookingForm(): () => void {
  const form = document.querySelector<HTMLFormElement>('[data-booking-form]');
  const booking = document.querySelector<HTMLElement>('#booking');
  const serviceSelect = form?.elements.namedItem('service') as HTMLSelectElement | null;
  const serviceButtons = document.querySelectorAll<HTMLButtonElement>(
    '[data-book-service]',
  );
  const requestedService = readBookingService(window.location.search);

  if (
    requestedService &&
    Array.from(serviceSelect?.options ?? []).some(
      (option) => option.value === requestedService,
    )
  ) {
    serviceSelect!.value = requestedService;
  }

  const onServiceClick = (event: Event) => {
    const button = event.currentTarget as HTMLButtonElement;
    if (serviceSelect) serviceSelect.value = button.dataset.bookService ?? '';
    booking?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (!form) return;
    const formData = new FormData(form);
    const url = buildTelegramUrl({
      name: String(formData.get('name') ?? ''),
      service: String(formData.get('service') ?? ''),
      date: String(formData.get('date') ?? ''),
      brief: String(formData.get('brief') ?? ''),
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  serviceButtons.forEach((button) =>
    button.addEventListener('click', onServiceClick),
  );
  form?.addEventListener('submit', onSubmit);

  return () => {
    serviceButtons.forEach((button) =>
      button.removeEventListener('click', onServiceClick),
    );
    form?.removeEventListener('submit', onSubmit);
  };
}
