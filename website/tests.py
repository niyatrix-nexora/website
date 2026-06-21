from django.test import TestCase


class WebsiteRouteTests(TestCase):
    def test_pages_render_shared_assets_from_static_root(self):
        for url in ("/", "/blog/", "/careers/"):
            with self.subTest(url=url):
                response = self.client.get(url)

                self.assertEqual(response.status_code, 200)
                self.assertContains(response, 'href="/static/css/styles.css?v=20260522-1"')
                self.assertContains(response, '"/static/js/three.min.js"')
                self.assertContains(response, '"/static/js/gsap.min.js"')
                self.assertContains(response, '"/static/js/script.js?v=20260616-2"')

    def test_navbars_keep_the_same_main_destinations(self):
        expected_links = (
            'href="/#services"',
            'href="/#case-studies"',
            'href="/#about"',
            'href="/blog/"',
            'href="/careers/"',
            'href="/#contact"',
        )

        for url in ("/", "/blog/", "/careers/"):
            with self.subTest(url=url):
                response = self.client.get(url)

                for link in expected_links:
                    self.assertContains(response, link)

    def test_home_does_not_post_debug_javascript_errors(self):
        response = self.client.get("/")

        self.assertNotContains(response, "/js-error/")
        self.assertNotContains(response, "/js-debug/")
