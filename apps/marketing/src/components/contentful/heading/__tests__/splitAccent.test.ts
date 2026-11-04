import {splitAccent} from '../splitAccent';

describe('splitAccent', () => {
  it('returns one plain segment when there are no markers', () => {
    expect(splitAccent('Plain heading')).toEqual([
      {text: 'Plain heading', accent: false},
    ]);
  });

  it('splits a trailing accent and keeps the separating space', () => {
    expect(
      splitAccent('Digital fluency for every student, *in every classroom.*'),
    ).toEqual([
      {text: 'Digital fluency for every student, ', accent: false},
      {text: 'in every classroom.', accent: true},
    ]);
  });

  it('supports leading, middle and multiple accents', () => {
    expect(splitAccent('*AI* for *every* student')).toEqual([
      {text: 'AI', accent: true},
      {text: ' for ', accent: false},
      {text: 'every', accent: true},
      {text: ' student', accent: false},
    ]);
  });

  it('leaves unmatched and empty markers literal', () => {
    expect(splitAccent('Free* for all')).toEqual([
      {text: 'Free* for all', accent: false},
    ]);
    expect(splitAccent('Empty ** marker')).toEqual([
      {text: 'Empty ** marker', accent: false},
    ]);
  });
});
