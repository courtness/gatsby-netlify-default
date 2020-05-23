/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const chalk = require(`chalk`);
const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);
const { fmImagesToRelative } = require(`gatsby-remark-relative-images`);

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "~assets": path.resolve(__dirname, `src/assets`),
        "~components": path.resolve(__dirname, `src/components`),
        "~context": path.resolve(__dirname, `src/context`),
        "~node_modules": path.resolve(__dirname, `node_modules`),
        "~scss": path.resolve(__dirname, `src/scss`),
        "~utils": path.resolve(__dirname, `src/utils`)
      }
    }
  });
};

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  return graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              templateKey
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      throw result.errors;
    }

    const pages = result.data.allMarkdownRemark.edges;

    pages.forEach(edge => {
      const { id } = edge.node;

      createPage({
        path: edge.node.fields.slug,
        component: path.resolve(
          `src/templates/${String(edge.node.frontmatter.templateKey)}.js`
        ),
        context: {
          id
        }
      });
    });

    return true;
  });
};

/*
// Wordpress

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allWordpressPost {
        edges {
          node {
            id
            slug
          }
        }
      }
    }
  `);

  if (result.errors) {
    // eslint-disable-next-line no-console
    console.error(result.errors);
  }

  const { allWordpressPost } = result.data;

  const postTemplate = path.resolve(`./src/templates/wordpress-post.js`);

  allWordpressPost.edges.forEach(edge => {
    createPage({
      path: `/${edge.node.slug}/`,
      component: slash(postTemplate),
      context: {
        id: edge.node.id
      }
    });
  });
};
*/

/*
// Shopify

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              templateKey
              overrideSlug
            }
          }
        }
      }
      allShopifyProduct {
        edges {
          node {
            handle
            variants {
              id
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
      allShopifyAdminProduct {
        edges {
          node {
            id
            products {
              alternative_id
              handle
              variants {
                alternative_id
                title
              }
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      throw result.errors;
    }

    const { allMarkdownRemark, allShopifyAdminProduct } = result.data;

    allShopifyAdminProduct.edges.forEach(edge => {
      if (edge.node.id === `dummy`) {
        return;
      }

      edge.node.products.forEach(shopifyProduct => {
        const { handle } = shopifyProduct;
        let pagePath = `/products/${handle}`;
        let markdownId = ``;

        //
        // override Shopify product with local markdown, if available

        allMarkdownRemark.edges.forEach(({ node }) => {
          const { slug } = node.fields;

          if (slug === pagePath || slug === `${pagePath}/`) {
            const { overrideSlug } = node.frontmatter;

            markdownId = node.id;
            pagePath = `/products/${overrideSlug}`;
          }
        });

        //

        if (markdownId !== ``) {
          console.log(
            `${chalk.blue(`createPages → shopify [markdown] |`)} ${pagePath}`
          );
        } else {
          console.log(
            `${chalk.green(`createPages → shopify [defaults] |`)} ${pagePath}`
          );
        }

        createPage({
          path: pagePath,
          component: path.resolve(`src/templates/shopify-product-page.js`),
          context: {
            markdownId,
            handle
          }
        });
      });
    });

    allMarkdownRemark.edges.forEach(({ node }) => {
      const { id, frontmatter } = node;
      const { slug } = node.fields;

      if (!slug.startsWith(`/products/`) || slug === `/products/`) {
        createPage({
          path: slug,
          component: path.resolve(
            `src/templates/${String(frontmatter.templateKey)}.js`
          ),
          context: {
            id
          }
        });
      }
    });

    return true;
  });
};
*/

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  fmImagesToRelative(node);

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });

    createNodeField({
      name: `slug`,
      node,
      value
    });
  }
};
