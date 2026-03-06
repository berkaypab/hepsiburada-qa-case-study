import type { Page } from "@playwright/test";
import type { HomePage, SearchResultsPage, ProductDetailPage, ReviewsPage, CartPage } from "pages/e2e";
import type AxeBuilder from "@axe-core/playwright";

export type PagesFixture = {
    setupContext: void;
    homePage: HomePage;
    searchPage: SearchResultsPage;
    productDetailPage: ProductDetailPage;
    reviewsPage: ReviewsPage;
    cartPage: CartPage;
    makeAxeBuilder: (targetPage: Page) => AxeBuilder;
    searchAndPickProduct: (term: string) => Promise<{
        newPage: Page;
        title: string;
        price: string;
    }>;
    productSetup: (term: string) => Promise<{
        page: Page;
        pdp: ProductDetailPage;
        reviews: ReviewsPage;
        title: string;
        price: string;
    }>;
};
