import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const Home = () => import('views/home/Home');

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
}

const route = [
  {
    path: '',
    redirect : '/home'
  },
  {
    path: '/home',
    component: Home
  }
];

const router = new Router({
  routes: route,
  mode: 'history'
});

export default router;