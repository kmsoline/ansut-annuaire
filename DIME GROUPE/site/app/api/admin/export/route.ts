import { NextRequest, NextResponse } from "next/server";
import { checkAdminRole } from "@/lib/api-auth";
import { dbSelect, getContentSetting } from "@/lib/db";
import { legalPages, pageMetadata, homePageContent, aboutPageContent, afriNomadeContent } from "@/lib/content-data";
import { headerLinks, footerSections, siteLogo } from "@/lib/navigation-data";

export async function GET(request: NextRequest) {
  if (!(await checkAdminRole())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    if (type === "all" || type === "blog") {
      data.blogPosts = await dbSelect("blog_articles", "select=*");
    }
    if (type === "all" || type === "portfolio") {
      data.portfolioItems = await dbSelect("portfolio_items", "select=*");
    }
    if (type === "all" || type === "services") {
      data.services = await dbSelect("services", "select=*");
    }
    if (type === "all" || type === "contacts") {
      data.contacts = await dbSelect("contacts", "select=*");
    }
    if (type === "all" || type === "faq") {
      data.faqItems = await dbSelect("faq_items", "select=*");
    }
    if (type === "all" || type === "testimonials") {
      data.testimonials = await dbSelect("testimonials", "select=*");
    }
    if (type === "all" || type === "client-logos") {
      data.clientLogos = await dbSelect("client_logos", "select=*");
    }
    if (type === "all" || type === "newsletter") {
      data.newsletter = await dbSelect("newsletter_subscribers", "select=*");
    }
    if (type === "all" || type === "homepage") {
      data.homePageContent = (await getContentSetting("homepage_content")) ?? homePageContent;
    }
    if (type === "all" || type === "about") {
      data.aboutPageContent = (await getContentSetting("about_content")) ?? aboutPageContent;
    }
    if (type === "all" || type === "legal") {
      data.legalPages = (await getContentSetting("legal_pages")) ?? legalPages;
    }
    if (type === "all" || type === "afrinomade") {
      data.afriNomadeContent = (await getContentSetting("afrinomade_content")) ?? afriNomadeContent;
    }
    if (type === "all" || type === "metadata") {
      data.pageMetadata = (await getContentSetting("page_metadata")) ?? pageMetadata;
    }
    if (type === "all" || type === "navigation") {
      data.navigation = {
        headerLinks: (await getContentSetting("nav_header")) ?? headerLinks,
        footerSections: (await getContentSetting("nav_footer")) ?? footerSections,
        siteLogo: (await getContentSetting("nav_logo")) ?? siteLogo,
      };
    }
    if (type === "all" || type === "settings") {
      data.settings = await dbSelect("site_settings", "select=key,value,updated_at");
    }

    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="export-${type}-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
  }
}
