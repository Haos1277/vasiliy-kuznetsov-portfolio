import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildTelegramUrl,
  initBookingForm,
  readBookingService,
} from '../src/lib/booking';

describe('booking', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    history.replaceState({}, '', '/');
    vi.restoreAllMocks();
  });

  it('accepts only approved services from the URL', () => {
    expect(readBookingService('?service=Музыка')).toBe('Музыка');
    expect(readBookingService('?service=Неизвестно')).toBeNull();
  });

  it('preselects an approved service only when the form has its option', () => {
    history.replaceState({}, '', '/?service=Видеосъёмка#booking');
    document.body.innerHTML = `
      <section id="booking"><form data-booking-form>
        <select name="service">
          <option value="">Выберите услугу</option>
          <option>Видеосъёмка</option>
        </select>
      </form></section>`;

    const cleanup = initBookingForm();

    expect(document.querySelector<HTMLSelectElement>('select')?.value).toBe(
      'Видеосъёмка',
    );
    cleanup();
  });

  it('does not select an approved service absent from the form options', () => {
    history.replaceState({}, '', '/?service=Музыка#booking');
    document.body.innerHTML = `
      <section id="booking"><form data-booking-form>
        <select name="service">
          <option value="">Выберите услугу</option>
          <option>Видеосъёмка</option>
        </select>
      </form></section>`;

    const cleanup = initBookingForm();

    expect(document.querySelector<HTMLSelectElement>('select')?.value).toBe('');
    cleanup();
  });

  it('builds a readable Telegram draft without storing form data', () => {
    const url = buildTelegramUrl({
      name: 'Анна',
      service: 'Фотосессия',
      date: '2026-09-15',
      brief: 'Портретная съёмка на улице.',
    });

    expect(url.startsWith('https://t.me/wasiliy12777?text=')).toBe(true);
    expect(decodeURIComponent(url.split('?text=')[1])).toBe(
      'Здравствуйте, Василий!\nМеня зовут Анна.\nИнтересует: Фотосессия.\nЖелаемая дата: 2026-09-15.\nЗадача: Портретная съёмка на улице.',
    );
  });

  it('preselects a service from a discipline button', () => {
    document.body.innerHTML = `
      <button data-book-service="AI-проект">Обсудить проект</button>
      <section id="booking"><form data-booking-form>
        <select name="service"><option>AI-проект</option></select>
      </form></section>
    `;
    const booking = document.querySelector<HTMLElement>('#booking')!;
    booking.scrollIntoView = vi.fn();

    const cleanup = initBookingForm();
    document.querySelector<HTMLButtonElement>('[data-book-service]')!.click();

    expect(document.querySelector<HTMLSelectElement>('select')!.value).toBe(
      'AI-проект',
    );
    expect(booking.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    cleanup();
  });
});
