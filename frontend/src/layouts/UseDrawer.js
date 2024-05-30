import { ref } from "vue";
const drawer = ref(true);
const rail = ref(true);
const permanent = ref(true);

export default function useDrawer() {
  const toggleDrawer = () => {
    drawer.value = !drawer.value;
  };

  const setDrawer = (value) => {
    drawer.value = value;
  };

  const toggleRail = () => {
    rail.value = !rail.value;
  };

  const setRail = (value) => {
    rail.value = value;
  };

  const togglePermanent = () => {
    permanent.value = !permanent.value;
  };

  const setPermanent = (value) => {
    permanent.value = value;
  };

  return {
    drawer,
    rail,
    permanent,
    toggleDrawer,
    setDrawer,
    toggleRail,
    setRail,
    togglePermanent,
    setPermanent,
  };
}
