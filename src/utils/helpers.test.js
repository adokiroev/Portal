import {getCurrencySymbol, getFreeProduct, getMemberName, getMemberSubscription, getPriceFromSubscription, getPriceIdFromPageQuery, hasMultipleProducts, isActiveOffer, isInviteOnlySite, isPaidMember, isSameCurrency} from './helpers';
import * as Fixtures from './fixtures-generator';
import {site as FixturesSite, member as FixtureMember, offer as FixtureOffer} from '../utils/test-fixtures';
import {isComplimentaryMember} from '../utils/helpers';

describe('Helpers - ', () => {
    describe('isComplimentaryMember -', () => {
        test('returns true for complimentary member', () => {
            const value = isComplimentaryMember({member: FixtureMember.complimentary});
            expect(value).toBe(true);
        });

        test('returns true for complimentary member with subscription', () => {
            const value = isComplimentaryMember({member: FixtureMember.complimentaryWithSubscription});
            expect(value).toBe(true);
        });

        test('returns false for free member', () => {
            const value = isComplimentaryMember({member: FixtureMember.free});
            expect(value).toBe(false);
        });

        test('returns false for paid member', () => {
            const value = isComplimentaryMember({member: FixtureMember.paid});
            expect(value).toBe(false);
        });
    });

    describe('isPaidMember -', () => {
        test('returns true for paid member', () => {
            const value = isPaidMember({member: FixtureMember.paid});
            expect(value).toBe(true);
        });

        test('returns true for complimentary member', () => {
            const value = isPaidMember({member: FixtureMember.complimentary});
            expect(value).toBe(true);
        });

        test('returns true for complimentary member with subscription', () => {
            const value = isPaidMember({member: FixtureMember.complimentaryWithSubscription});
            expect(value).toBe(true);
        });

        test('returns false for free member', () => {
            const value = isPaidMember({member: FixtureMember.free});
            expect(value).toBe(false);
        });
    });

    describe('isActiveOffer -', () => {
        test('returns true for active offer', () => {
            const value = isActiveOffer({offer: FixtureOffer});
            expect(value).toBe(true);
        });

        test('returns false for archived offer', () => {
            const archivedOffer = {
                ...FixtureOffer,
                status: 'archived'
            };
            const value = isActiveOffer({offer: archivedOffer});
            expect(value).toBe(false);
        });
    });

    describe('isSameCurrency - ', () => {
        test('can match two currencies correctly ', () => {
            let currency1 = 'USD';
            let currency2 = 'USD';
            expect(isSameCurrency(currency1, currency2)).toBe(true);
        });
        test('can match currencies with case mismatch', () => {
            let currency1 = 'USD';
            let currency2 = 'usd';
            expect(isSameCurrency(currency1, currency2)).toBe(true);
        });
        test('can match currencies with case mismatch', () => {
            let currency1 = 'eur';
            let currency2 = 'usd';
            expect(isSameCurrency(currency1, currency2)).toBe(false);
        });
    });

    describe('isInviteOnlySite - ', () => {
        test('returns true for invite only site', () => {
            const value = isInviteOnlySite({site: FixturesSite.singleTier.inviteOnly});
            expect(value).toBe(true);
        });
        test('returns false for non invite only site', () => {
            const value = isInviteOnlySite({site: FixturesSite.singleTier.basic});
            expect(value).toBe(false);
        });
    });

    describe('hasMultipleProducts - ', () => {
        test('returns true for multiple tier site', () => {
            const value = hasMultipleProducts({site: FixturesSite.multipleTiers.basic});
            expect(value).toBe(true);
        });
        test('returns false for single tier site', () => {
            const value = hasMultipleProducts({site: FixturesSite.singleTier.basic});
            expect(value).toBe(false);
        });
    });

    describe('getFreeProduct - ', () => {
        test('returns free tier for site', () => {
            const product = getFreeProduct({site: FixturesSite.singleTier.basic});
            expect(product.type).toBe('free');
        });
    });

    describe('getMemberName - ', () => {
        test('returns name for logged in member', () => {
            const member = FixtureMember.free;
            const memberName = getMemberName({member});
            expect(memberName).toBe(member.name);
        });

        test('returns empty string for logged-out member', () => {
            const member = null;
            const memberName = getMemberName({member});
            expect(memberName).toBe('');
        });
    });

    describe('getMemberSubscription -', () => {
        describe('returns active sub for paid member', () => {
            test('with only active sub in list', () => {
                const member = FixtureMember.paid;
                const value = getMemberSubscription({member});
                const subscription = member.subscriptions[0];
                expect(value).toBe(subscription);
            });

            test('with inactive subs in list', () => {
                const member = FixtureMember.paidWithCanceledSubscription;
                const value = getMemberSubscription({member});
                const subscription = member.subscriptions.find(d => d.status === 'active');
                expect(value).toBe(subscription);
            });
        });

        test('returns null for free member', () => {
            const member = FixtureMember.free;
            const value = getMemberSubscription({member});
            expect(value).toBe(null);
        });

        test('returns undefined for complimentary member without subscription', () => {
            const member = FixtureMember.complimentary;
            const value = getMemberSubscription({member});
            expect(value).toBe(undefined);
        });

        test('returns sub for complimentary member with subscription', () => {
            const member = FixtureMember.complimentaryWithSubscription;
            const value = getMemberSubscription({member});
            const subscription = member.subscriptions.find(d => d.status === 'active');
            expect(value).toBe(subscription);
        });
    });

    describe('getPriceFromSubscription -', () => {
        test('returns expected price object for paid member', () => {
            const member = FixtureMember.paid;
            const subscription = getMemberSubscription({member});
            const value = getPriceFromSubscription({subscription});
            expect(value).toStrictEqual({
                ...subscription.price,
                stripe_price_id: subscription.price.id,
                id: subscription.price.price_id,
                price: subscription.price.amount / 100,
                name: subscription.price.nickname,
                currency: subscription.price.currency.toLowerCase(),
                currency_symbol: getCurrencySymbol(subscription.price.currency)
            });
        });

        test('returns null for invalid subscription', () => {
            const value = getPriceFromSubscription({subscription: {}});
            expect(value).toBe(null);
        });
    });

    describe('getPriceIdFromPageQuery - ', () => {
        test('can correctly fetch price id from page query ', () => {
            const mockPriceIdFn = getPriceIdFromPageQuery;
            const siteData = Fixtures.getSiteData();
            const testProduct = siteData.products?.[0];
            const pageQuery = `${testProduct?.id}/yearly`;
            const expectedPriceId = testProduct.yearlyPrice.id;
            const value = mockPriceIdFn({site: siteData, pageQuery});
            expect(value).toBe(expectedPriceId);
        });
    });
});
