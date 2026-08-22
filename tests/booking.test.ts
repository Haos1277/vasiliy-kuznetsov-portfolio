import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildTelegramUrl, initBookingForm } from '../src/lib/booking';

describe('booking', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
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
